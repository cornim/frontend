import { customElement, property, PropertyValues } from "lit-element";
import { HassioPanelInfo } from "../../src/data/hassio/supervisor";
import { Supervisor } from "../../src/data/supervisor/supervisor";
import {
  HassRouterPage,
  RouterOptions,
} from "../../src/layouts/hass-router-page";
import "../../src/resources/ha-style";
import { HomeAssistant } from "../../src/types";
// Don't codesplit it, that way the dashboard always loads fast.
import "./hassio-panel";

@customElement("hassio-router")
class HassioRouter extends HassRouterPage {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public supervisor!: Supervisor;

  @property({ attribute: false }) public panel!: HassioPanelInfo;

  @property({ type: Boolean }) public narrow!: boolean;

  protected routerOptions: RouterOptions = {
    // Hass.io has a page with tabs, so we route all non-matching routes to it.
    defaultPage: "dashboard",
    initialLoad: () => this._fetchData(),
    showLoading: true,
    routes: {
      dashboard: {
        tag: "hassio-panel",
        cache: true,
      },
      snapshots: "dashboard",
      store: "dashboard",
      system: "dashboard",
      addon: {
        tag: "hassio-addon-dashboard",
        load: () => import("./addon-view/hassio-addon-dashboard"),
      },
      ingress: {
        tag: "hassio-ingress-view",
        load: () => import("./ingress-view/hassio-ingress-view"),
      },
    },
  };

  protected firstUpdated(changedProps: PropertyValues) {
    super.firstUpdated(changedProps);
    this.addEventListener("hass-api-called", (ev) => this._apiCalled(ev));
  }

  protected updatePageEl(el) {
    // the tabs page does its own routing so needs full route.
    const route = el.nodeName === "HASSIO-PANEL" ? this.route : this.routeTail;

    el.hass = this.hass;
    el.supervisor = this.supervisor;
    el.narrow = this.narrow;
    el.supervisorInfo = this.supervisor.supervisor;
    el.hassioInfo = this.supervisor.info;
    el.hostInfo = this.supervisor.host;
    el.hassInfo = this.supervisor.core;
    el.hassOsInfo = this.supervisor.os;
    el.route = route;

    if (el.localName === "hassio-ingress-view") {
      el.ingressPanel = this.panel.config && this.panel.config.ingress;
    }
  }

  private async _fetchData() {
    if (this.panel.config && this.panel.config.ingress) {
      this._redirectIngress(this.panel.config.ingress);
    }
  }

  private _redirectIngress(addonSlug: string) {
    this.route = { prefix: "/hassio", path: `/ingress/${addonSlug}` };
  }

  private _apiCalled(ev) {
    if (!ev.detail.success) {
      return;
    }

    let tries = 1;

    const tryUpdate = () => {
      this._fetchData().catch(() => {
        tries += 1;
        setTimeout(tryUpdate, Math.min(tries, 5) * 1000);
      });
    };

    tryUpdate();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hassio-router": HassioRouter;
  }
}
