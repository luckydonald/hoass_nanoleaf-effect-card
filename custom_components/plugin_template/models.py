"""Alarm data models for Plugin Template."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Self


@dataclass
class Alarm:
    """Represents an alarm."""

    id: str
    name: str
    time: datetime
    enabled: bool = True
    repeat: str = "none"
    snooze_count: int = 0
    timeout: float | None = None
    max_snoozes: int | None = None
    snooze_duration: int | None = None
    state: str = "before"
    next_snooze_time: datetime | None = None
    calendar_event_uid: str | None = None

    # Original event data from calendar
    _calendar_data: dict[str, Any] = field(default_factory=dict)

    @property
    def is_snooze(self) -> bool:
        """Check if this is a snoozed alarm."""
        return self.snooze_count > 0

    @property
    def base_id(self) -> str:
        """Get the base alarm ID without snooze suffix."""
        if "-snooze-" in self.id:
            return self.id.rsplit("-snooze-", 1)[0]
        return self.id

    def to_dict(self) -> dict[str, Any]:
        """Convert alarm to dictionary."""
        return {
            "id": self.id,
            "name": self.name,
            "time": self.time.isoformat() if self.time else None,
            "enabled": self.enabled,
            "repeat": self.repeat,
            "snooze_count": self.snooze_count,
            "timeout": self.timeout,
            "max_snoozes": self.max_snoozes,
            "snooze_duration": self.snooze_duration,
            "state": self.state,
            "next_snooze_time": (
                self.next_snooze_time.isoformat() if self.next_snooze_time else None
            ),
        }

    @classmethod
    def from_calendar_event(cls, event: dict[str, Any]) -> Self:
        """Create an Alarm from a calendar event."""
        summary: str = event.get("summary", "Alarm")
        uid: str = event.get("uid", "")
        start = event.get("start")

        # Parse time from event
        alarm_time: datetime
        if isinstance(start, str):
            try:
                alarm_time = datetime.fromisoformat(start.replace("Z", "+00:00"))
            except ValueError:
                alarm_time = datetime.now()
        elif isinstance(start, datetime):
            alarm_time = start
        else:
            alarm_time = datetime.now()

        # Check for snooze prefix
        snooze_count: int = 0
        name: str = summary
        enabled: bool = True

        if summary.startswith("[SNOOZE "):
            # Parse snooze count: [SNOOZE 1] Alarm Name
            try:
                end_bracket = summary.index("]")
                snooze_str = summary[8:end_bracket]
                snooze_count = int(snooze_str)
                name = summary[end_bracket + 2 :]  # Skip "] "
            except (ValueError, IndexError):
                pass

        # Check for disabled prefix
        if summary.startswith("[DISABLED] "):
            enabled = False
            name = summary[11:]

        # Check for dismissed prefix
        state: str = "before"
        if summary.startswith("[DISMISSED] "):
            state = "dismissed"
            name = summary[12:]

        # Parse repeat from rrule if present
        repeat: str = "none"
        rrule: str | None = event.get("rrule")
        if rrule:
            if "FREQ=DAILY" in rrule:
                repeat = "daily"
            elif "FREQ=WEEKLY" in rrule:
                if "BYDAY=MO,TU,WE,TH,FR" in rrule:
                    repeat = "weekdays"
                elif "BYDAY=SA,SU" in rrule:
                    repeat = "weekends"
                else:
                    repeat = "weekly"
            else:
                repeat = rrule  # Store custom rrule

        alarm_id: str = uid
        if "-snooze-" in uid:
            # Already has snooze suffix
            pass
        elif snooze_count > 0:
            alarm_id = f"{uid}-snooze-{snooze_count}"

        return cls(
            id=alarm_id,
            name=name,
            time=alarm_time,
            enabled=enabled,
            repeat=repeat,
            snooze_count=snooze_count,
            state=state,
            calendar_event_uid=uid,
            _calendar_data=event,
        )
