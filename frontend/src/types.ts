// Home Assistant types
export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed: string;
  last_updated: string;
  context: {
    id: string;
    parent_id: string | null;
    user_id: string | null;
  };
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  services: Record<string, Record<string, unknown>>;
  user: {
    id: string;
    name: string;
    is_admin: boolean;
  };
  language: string;
  callService: (
    domain: string,
    service: string,
    data?: Record<string, unknown>,
    target?: {
      entity_id?: string | string[];
    },
  ) => Promise<void>;
}

// Card config types
export interface ButtonStyleColorState {
  active?: boolean;
  inactive?: boolean;
  hover?: boolean;
}

export interface ColorDisplayConfig {
  full_background?: ButtonStyleColorState;
  small_bar?: ButtonStyleColorState;
  text?: ButtonStyleColorState;
  border?: ButtonStyleColorState;
  animated_icon?: ButtonStyleColorState;
}

export interface ButtonStyle {
  inactive_color?: string;
  icon?: boolean;
  name?: boolean;
  compact?: boolean;
  color_display?: ColorDisplayConfig;
}

export interface Effect {
  name: string;
  icon?: string;
  color?: string;
  colors?: string[];
  button_style?: ButtonStyle;
}

export interface CardConfig {
  type?: string;
  entity?: string;
  display?: 'buttons' | 'dropdown';
  button_style?: ButtonStyle;
  effects?: Effect[];
  show_off?: boolean;
  show_none?: boolean;
}

// Style keys for color display
export type StyleKey = 'full_background' | 'small_bar' | 'text' | 'border' | 'animated_icon';
