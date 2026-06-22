"""Config flow for Nanoleaf Effect Card."""
from homeassistant.config_entries import ConfigFlow, ConfigFlowResult

from .const import DOMAIN


class NanoleafEffectCardConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Nanoleaf Effect Card."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict | None = None
    ) -> ConfigFlowResult:
        """Handle the initial step."""
        if user_input is not None:
            return self.async_create_entry(title="Nanoleaf Effect Card", data=user_input)
        return self.async_show_form(step_id="user")
