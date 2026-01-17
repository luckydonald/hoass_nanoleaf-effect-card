"""Services for Calendar Alarm Clock."""

from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers import config_validation as cv

from .alarm_manager import AlarmManager
from .const import (
    ATTR_ALARM_ID,
    ATTR_ENABLED,
    ATTR_NAME,
    ATTR_REPEAT,
    ATTR_TIME,
    DEFAULT_NAME,
    DOMAIN,
    LOG_NAME,
    SERVICE_CREATE_ALARM,
    SERVICE_DELETE_ALARM,
    SERVICE_DISABLE_ALARM,
    SERVICE_DISMISS_ALARM,
    SERVICE_EDIT_ALARM,
    SERVICE_ENABLE_ALARM,
    SERVICE_LIST_ALARMS,
    SERVICE_SNOOZE_ALARM,
    SERVICE_TRIGGER_ALARM,
)

_LOGGER = logging.getLogger(LOG_NAME)

# Service schemas
SERVICE_CREATE_ALARM_SCHEMA: vol.Schema = vol.Schema(
    {
        vol.Optional(ATTR_NAME, default=DEFAULT_NAME): cv.string,
        vol.Optional(ATTR_TIME): cv.string,
        vol.Optional("date"): cv.string,
        vol.Optional(ATTR_REPEAT, default="none"): cv.string,
        vol.Optional(ATTR_ENABLED, default=True): cv.boolean,
    }
)

SERVICE_ALARM_BY_ID_SCHEMA: vol.Schema = vol.Schema(
    {
        vol.Optional("entity_id"): cv.entity_id,
        vol.Optional(ATTR_ALARM_ID): cv.string,
    }
)

SERVICE_SNOOZE_ALARM_SCHEMA: vol.Schema = vol.Schema(
    {
        vol.Optional("entity_id"): cv.entity_id,
        vol.Optional(ATTR_ALARM_ID): cv.string,
        vol.Optional("duration"): vol.Coerce(int),
    }
)

SERVICE_EDIT_ALARM_SCHEMA: vol.Schema = vol.Schema(
    {
        vol.Optional("entity_id"): cv.entity_id,
        vol.Optional(ATTR_ALARM_ID): cv.string,
        vol.Optional(ATTR_NAME): cv.string,
        vol.Optional(ATTR_TIME): cv.string,
        vol.Optional(ATTR_REPEAT): cv.string,
        vol.Optional(ATTR_ENABLED): cv.boolean,
    }
)


def _get_manager(hass: HomeAssistant) -> AlarmManager | None:
    """Get the alarm manager."""
    for entry_data in hass.data.get(DOMAIN, {}).values():
        if "manager" in entry_data:
            return entry_data["manager"]
    return None


def _get_alarm_id_from_call(hass: HomeAssistant, call: ServiceCall) -> str | None:
    """Extract alarm ID from service call."""
    alarm_id: str | None = call.data.get(ATTR_ALARM_ID)
    if alarm_id:
        return alarm_id

    entity_id: str | None = call.data.get("entity_id")
    # Extract alarm ID from entity ID
    # Entity ID format: sensor.alarm_clock_ALARM_ID
    if entity_id and entity_id.startswith("sensor.alarm_clock_"):
        return entity_id.replace("sensor.alarm_clock_", "")

    return None


async def async_setup_services(hass: HomeAssistant) -> None:
    """Set up services for Calendar Alarm Clock."""

    async def handle_create_alarm(call: ServiceCall) -> dict[str, Any]:
        """Handle create_alarm service call."""
        manager: AlarmManager | None = _get_manager(hass)
        if not manager:
            _LOGGER.error("No alarm manager found")
            return {"success": False, "error": "No alarm manager"}

        alarm = await manager.async_create_alarm(
            name=call.data.get(ATTR_NAME, DEFAULT_NAME),
            time=call.data.get(ATTR_TIME),
            date=call.data.get("date"),
            repeat=call.data.get(ATTR_REPEAT, "none"),
            enabled=call.data.get(ATTR_ENABLED, True),
        )

        if alarm:
            return {"success": True, "alarm": alarm.to_dict()}
        return {"success": False, "error": "Failed to create alarm"}

    async def handle_delete_alarm(call: ServiceCall) -> dict[str, Any]:
        """Handle delete_alarm service call."""
        manager: AlarmManager | None = _get_manager(hass)
        if not manager:
            return {"success": False, "error": "No alarm manager"}

        alarm_id: str | None = _get_alarm_id_from_call(hass, call)
        if not alarm_id:
            return {"success": False, "error": "No alarm ID provided"}

        result: bool = await manager.async_delete_alarm(alarm_id)
        return {"success": result}

    async def handle_enable_alarm(call: ServiceCall) -> dict[str, Any]:
        """Handle enable_alarm service call."""
        manager: AlarmManager | None = _get_manager(hass)
        if not manager:
            return {"success": False, "error": "No alarm manager"}

        alarm_id: str | None = _get_alarm_id_from_call(hass, call)
        if not alarm_id:
            return {"success": False, "error": "No alarm ID provided"}

        result: bool = await manager.async_enable_alarm(alarm_id)
        return {"success": result}

    async def handle_disable_alarm(call: ServiceCall) -> dict[str, Any]:
        """Handle disable_alarm service call."""
        manager: AlarmManager | None = _get_manager(hass)
        if not manager:
            return {"success": False, "error": "No alarm manager"}

        alarm_id: str | None = _get_alarm_id_from_call(hass, call)
        if not alarm_id:
            return {"success": False, "error": "No alarm ID provided"}

        result: bool = await manager.async_disable_alarm(alarm_id)
        return {"success": result}

    async def handle_snooze_alarm(call: ServiceCall) -> dict[str, Any]:
        """Handle snooze_alarm service call."""
        manager: AlarmManager | None = _get_manager(hass)
        if not manager:
            return {"success": False, "error": "No alarm manager"}

        alarm_id: str | None = _get_alarm_id_from_call(hass, call)
        if not alarm_id:
            return {"success": False, "error": "No alarm ID provided"}

        duration: int | None = call.data.get("duration")
        result: bool = await manager.async_snooze_alarm(alarm_id, duration)
        return {"success": result}

    async def handle_dismiss_alarm(call: ServiceCall) -> dict[str, Any]:
        """Handle dismiss_alarm service call."""
        manager: AlarmManager | None = _get_manager(hass)
        if not manager:
            return {"success": False, "error": "No alarm manager"}

        alarm_id: str | None = _get_alarm_id_from_call(hass, call)
        if not alarm_id:
            return {"success": False, "error": "No alarm ID provided"}

        result: bool = await manager.async_dismiss_alarm(alarm_id)
        return {"success": result}

    async def handle_trigger_alarm(call: ServiceCall) -> dict[str, Any]:
        """Handle trigger_alarm service call."""
        manager: AlarmManager | None = _get_manager(hass)
        if not manager:
            return {"success": False, "error": "No alarm manager"}

        alarm_id: str | None = _get_alarm_id_from_call(hass, call)
        if not alarm_id:
            return {"success": False, "error": "No alarm ID provided"}

        result: bool = await manager.async_trigger_alarm(alarm_id)
        return {"success": result}

    async def handle_edit_alarm(call: ServiceCall) -> dict[str, Any]:
        """Handle edit_alarm service call."""
        manager: AlarmManager | None = _get_manager(hass)
        if not manager:
            return {"success": False, "error": "No alarm manager"}

        alarm_id: str | None = _get_alarm_id_from_call(hass, call)
        if not alarm_id:
            return {"success": False, "error": "No alarm ID provided"}

        result: bool = await manager.async_edit_alarm(
            alarm_id=alarm_id,
            name=call.data.get(ATTR_NAME),
            time=call.data.get(ATTR_TIME),
            repeat=call.data.get(ATTR_REPEAT),
            enabled=call.data.get(ATTR_ENABLED),
        )
        return {"success": result}

    async def handle_list_alarms(call: ServiceCall) -> dict[str, Any]:
        """Handle list_alarms service call."""
        manager: AlarmManager | None = _get_manager(hass)
        if not manager:
            return {"success": False, "error": "No alarm manager", "alarms": []}

        alarms: list[dict[str, Any]] = manager.list_alarms()
        return {"success": True, "alarms": alarms}

    # Register services
    hass.services.async_register(
        DOMAIN,
        SERVICE_CREATE_ALARM,
        handle_create_alarm,
        schema=SERVICE_CREATE_ALARM_SCHEMA,
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_DELETE_ALARM,
        handle_delete_alarm,
        schema=SERVICE_ALARM_BY_ID_SCHEMA,
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_ENABLE_ALARM,
        handle_enable_alarm,
        schema=SERVICE_ALARM_BY_ID_SCHEMA,
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_DISABLE_ALARM,
        handle_disable_alarm,
        schema=SERVICE_ALARM_BY_ID_SCHEMA,
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_SNOOZE_ALARM,
        handle_snooze_alarm,
        schema=SERVICE_SNOOZE_ALARM_SCHEMA,
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_DISMISS_ALARM,
        handle_dismiss_alarm,
        schema=SERVICE_ALARM_BY_ID_SCHEMA,
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_TRIGGER_ALARM,
        handle_trigger_alarm,
        schema=SERVICE_ALARM_BY_ID_SCHEMA,
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_EDIT_ALARM,
        handle_edit_alarm,
        schema=SERVICE_EDIT_ALARM_SCHEMA,
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_LIST_ALARMS,
        handle_list_alarms,
        schema=vol.Schema({}),
    )


async def async_unload_services(hass: HomeAssistant) -> None:
    """Unload services for Calendar Alarm Clock."""
    services: list[str] = [
        SERVICE_CREATE_ALARM,
        SERVICE_DELETE_ALARM,
        SERVICE_ENABLE_ALARM,
        SERVICE_DISABLE_ALARM,
        SERVICE_LIST_ALARMS,
        SERVICE_EDIT_ALARM,
        SERVICE_TRIGGER_ALARM,
        SERVICE_SNOOZE_ALARM,
        SERVICE_DISMISS_ALARM,
    ]

    for service in services:
        hass.services.async_remove(DOMAIN, service)
