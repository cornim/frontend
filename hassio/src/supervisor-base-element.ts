import { LitElement, property, PropertyValues } from "lit-element";
import { Supervisor } from "../../src/data/supervisor/supervisor";
import { ProvideHassLitMixin } from "../../src/mixins/provide-hass-lit-mixin";
import { urlSyncMixin } from "../../src/state/url-sync-mixin";
import { HomeAssistant } from "../../src/types";

declare global {
  interface HASSDomEvents {
    "supervisor-update": Partial<Supervisor>;
  }
}

export class SupervisorBaseElement extends urlSyncMixin(
  ProvideHassLitMixin(LitElement)
) {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public supervisor!: Supervisor;

  protected _updateSupervisor(obj: Partial<Supervisor>) {
    this.supervisor = { ...this.supervisor, ...obj };
  }

  protected firstUpdated(changedProps: PropertyValues) {
    super.firstUpdated(changedProps);
    this.addEventListener("supervisor-update", (ev) =>
      this._updateSupervisor(ev.detail)
    );
  }
}
