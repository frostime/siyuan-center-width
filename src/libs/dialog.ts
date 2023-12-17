/*
 * Copyright (c) 2023 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2023-12-17 18:31:31
 * @FilePath     : /src/libs/dialog.ts
 * @LastEditTime : 2023-12-17 18:31:43
 * @Description  : 
 */

import { Dialog } from "siyuan";
import type WidthPlugin from "../index";

export class ChangeWidthDialog extends Dialog {

    value: number;

    constructor(plugin: WidthPlugin) {
        let dom = `
        <div id="plugin-width__setting">
            <div style="padding-bottom: 1rem">
                40%
                <input
                    class="b3-slider fn__size200 b3-tooltips b3-tooltips__s"
                    max="100" min="40" step="1" type="range" value="${plugin.width}"
                    aria-label="${plugin.width}%" id=""
                />
                100%
            </div>
            <label class="fn__flex">
                <div class="fn__flex-1">${plugin.i18n.setEnableMobile}</div> 
                <span class="fn__space"></span>
                <input class="b3-switch fn__flex-center" type="checkbox">
            </label>
        </div>
        `
        super({
            title: `${plugin.i18n.title}: ${plugin.width}%`,
            content: dom,
            destroyCallback: () => {
                plugin.save();
                plugin.updateAllPadding();
                console.log("Write width", plugin.width);
            }
        });
        let header: HTMLDivElement = this.element.querySelector('.b3-dialog__header');
        let body: HTMLDivElement = this.element.querySelector('.b3-dialog__body');
        body.style.padding = "1rem";
        header.style.textAlign = "center";

        const inputCenterWidth: HTMLInputElement = this.element.querySelector('input.b3-slider');
        inputCenterWidth.addEventListener("input", (e) => {
            plugin.width = parseInt((e.target as HTMLInputElement).value);
            header.innerText = `${plugin.i18n.title}: ${plugin.width}%`;
            inputCenterWidth.setAttribute("aria-label", `${plugin.width}%`);
            document.documentElement.style.setProperty('--centerWidth', `${plugin.width}%`);
        });

        const inputEnableMobile: HTMLInputElement = this.element.querySelector('input.b3-switch');
        inputEnableMobile.checked = plugin.enableMobile;
        inputEnableMobile.addEventListener("change", (e) => {
            plugin.enableMobile = (e.target as HTMLInputElement).checked;
        });
    }
}

