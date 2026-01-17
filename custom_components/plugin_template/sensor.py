"""Sensor platform for Plugin Template."""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .alarm_manager import AlarmManager
from .const import (
    ATTR_ALARM_ID,
    ATTR_ENABLED,
    ATTR_MAX_SNOOZES,
    ATTR_NAME,
    ATTR_NEXT_SNOOZE_TIME,
    ATTR_REPEAT,
    ATTR_SNOOZE_COUNT,
    ATTR_TIME,
    ATTR_TIMEOUT,
    DOMAIN,
    LOG_NAME,
)
from .models import Alarm

_LOGGER = logging.getLogger(LOG_NAME)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Plugin Template sensors."""
    manager: AlarmManager = hass.data[DOMAIN][entry.entry_id]["manager"]

    entities: dict[str, AlarmSensor] = {}

    # Create global next/previous alarm sensors
    next_alarm_sensor = NextAlarmSensor(manager, entry)
    previous_alarm_sensor = PreviousAlarmSensor(manager, entry)

    async_add_entities([next_alarm_sensor, previous_alarm_sensor])

    @callback
    def async_update_entities() -> None:
        """Update entities when alarms change."""
        current_alarm_ids: set[str] = set(manager.alarms.keys())
        existing_ids: set[str] = set(entities.keys())

        # Add new entities
        new_ids: set[str] = current_alarm_ids - existing_ids
        if new_ids:
            new_entities: list[AlarmSensor] = []
            for alarm_id in new_ids:
                alarm: Alarm = manager.alarms[alarm_id]
                sensor = AlarmSensor(manager, entry, alarm)
                entities[alarm_id] = sensor
                new_entities.append(sensor)
            async_add_entities(new_entities)

        # Update existing entities
        for alarm_id in current_alarm_ids & existing_ids:
            entities[alarm_id].async_update_from_alarm(manager.alarms[alarm_id])

        # Note: Removed entities will become unavailable
        # HA doesn't easily support dynamic removal
        for alarm_id in existing_ids - current_alarm_ids:
            entities[alarm_id].async_set_unavailable()

        # Update next/previous alarm sensors
        next_alarm_sensor.async_write_ha_state()
        previous_alarm_sensor.async_write_ha_state()

    # Initial entity creation
    async_update_entities()

    # Listen for updates
    manager.add_listener(async_update_entities)


class AlarmSensor(SensorEntity):
    """Sensor representing an alarm."""

    _attr_has_entity_name: bool = True
    _attr_icon: str = "mdi:alarm"
    _attr_should_poll: bool = False

    def __init__(
        self,
        manager: AlarmManager,
        entry: ConfigEntry,
        alarm: Alarm,
    ) -> None:
        """Initialize the alarm sensor."""
        self._manager: AlarmManager = manager
        self._entry: ConfigEntry = entry
        self._alarm: Alarm = alarm
        self._attr_unique_id: str = f"{entry.entry_id}_{alarm.id}"
        self._attr_name: str | None = alarm.name
        self._attr_native_value: str | None = alarm.state
        self._available: bool = True

    @property
    def device_info(self) -> DeviceInfo:
        """Return device info."""
        return DeviceInfo(
            identifiers={(DOMAIN, self._entry.entry_id)},
            name="Calendar Alarm Clock",
            manufacturer="Custom",
            model="Alarm Clock",
        )

    @property
    def available(self) -> bool:
        """Return if entity is available."""
        return self._available

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return extra state attributes."""
        return {
            ATTR_ALARM_ID: self._alarm.id,
            ATTR_NAME: self._alarm.name,
            ATTR_TIME: self._alarm.time.isoformat() if self._alarm.time else None,
            ATTR_ENABLED: self._alarm.enabled,
            ATTR_REPEAT: self._alarm.repeat,
            ATTR_NEXT_SNOOZE_TIME: (
                self._alarm.next_snooze_time.isoformat() if self._alarm.next_snooze_time else None
            ),
            ATTR_SNOOZE_COUNT: self._alarm.snooze_count,
            ATTR_TIMEOUT: self._alarm.timeout,
            ATTR_MAX_SNOOZES: self._alarm.max_snoozes,
        }

    @property
    def icon(self) -> str:
        """Return the icon based on state."""
        if self._alarm.state in ("ringing", "ringing_snooze"):
            return "mdi:alarm-note"
        elif self._alarm.state == "snoozed":
            return "mdi:alarm-snooze"
        elif not self._alarm.enabled:
            return "mdi:alarm-off"
        return "mdi:alarm"

    @callback
    def async_update_from_alarm(self, alarm: Alarm) -> None:
        """Update from alarm data."""
        self._alarm = alarm
        self._attr_name = alarm.name
        self._attr_native_value = alarm.state
        self._available = True
        self.async_write_ha_state()

    @callback
    def async_set_unavailable(self) -> None:
        """Set entity as unavailable."""
        self._available = False
        self.async_write_ha_state()


class NextAlarmSensor(SensorEntity):
    """Sensor for the next upcoming alarm."""

    _attr_has_entity_name: bool = True
    _attr_name: str | None = "Next Alarm"
    _attr_icon: str = "mdi:alarm"
    _attr_should_poll: bool = False

    def __init__(self, manager: AlarmManager, entry: ConfigEntry) -> None:
        """Initialize the next alarm sensor."""
        self._manager: AlarmManager = manager
        self._entry: ConfigEntry = entry
        self._attr_unique_id: str = f"{entry.entry_id}_next_alarm"

    @property
    def device_info(self) -> DeviceInfo:
        """Return device info."""
        return DeviceInfo(
            identifiers={(DOMAIN, self._entry.entry_id)},
            name="Calendar Alarm Clock",
            manufacturer="Custom",
            model="Alarm Clock",
        )

    @property
    def native_value(self) -> str | None:
        """Return the state (time of next alarm)."""
        alarm: Alarm | None = self._manager.next_alarm
        if alarm and alarm.time:
            return alarm.time.strftime("%Y-%m-%d %H:%M")
        return None

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return extra state attributes."""
        alarm: Alarm | None = self._manager.next_alarm
        if not alarm:
            return {}

        return {
            ATTR_ALARM_ID: alarm.id,
            ATTR_NAME: alarm.name,
            ATTR_TIME: alarm.time.isoformat() if alarm.time else None,
            ATTR_ENABLED: alarm.enabled,
            ATTR_REPEAT: alarm.repeat,
            ATTR_SNOOZE_COUNT: alarm.snooze_count,
            "state": alarm.state,
        }


class PreviousAlarmSensor(SensorEntity):
    """Sensor for the previous alarm."""

    _attr_has_entity_name: bool = True
    _attr_name: str | None = "Previous Alarm"
    _attr_icon: str = "mdi:alarm-check"
    _attr_should_poll: bool = False

    def __init__(self, manager: AlarmManager, entry: ConfigEntry) -> None:
        """Initialize the previous alarm sensor."""
        self._manager: AlarmManager = manager
        self._entry: ConfigEntry = entry
        self._attr_unique_id: str = f"{entry.entry_id}_previous_alarm"

    @property
    def device_info(self) -> DeviceInfo:
        """Return device info."""
        return DeviceInfo(
            identifiers={(DOMAIN, self._entry.entry_id)},
            name="Calendar Alarm Clock",
            manufacturer="Custom",
            model="Alarm Clock",
        )

    @property
    def native_value(self) -> str | None:
        """Return the state (time of previous alarm)."""
        alarm: Alarm | None = self._manager.previous_alarm
        if alarm and alarm.time:
            return alarm.time.strftime("%Y-%m-%d %H:%M")
        return None

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return extra state attributes."""
        alarm: Alarm | None = self._manager.previous_alarm
        if not alarm:
            return {}

        return {
            ATTR_ALARM_ID: alarm.id,
            ATTR_NAME: alarm.name,
            ATTR_TIME: alarm.time.isoformat() if alarm.time else None,
            ATTR_ENABLED: alarm.enabled,
            ATTR_REPEAT: alarm.repeat,
            ATTR_SNOOZE_COUNT: alarm.snooze_count,
            "state": alarm.state,
        }
