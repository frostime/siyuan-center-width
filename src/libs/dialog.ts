/*
 * Copyright (c) 2023 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2023-12-17 18:31:31
 * @FilePath     : /src/libs/dialog.ts
 * @LastEditTime : 2024-03-28 20:50:40
 * @Description  : 
 */

import { Dialog } from "siyuan";
import type WidthPlugin from "../index";

export class ChangeWidthDialog extends Dialog {

    value: number;

    constructor(plugin: WidthPlugin) {
        const width = plugin.settingUtils.get("width");
        // const enableMobile = plugin.settingUtils.get("enableMobile");

        let dom = `
        <div id="plugin-width__setting">
            <div style="padding-bottom: 1rem">
                40%
                <input
                    class="b3-slider fn__size200 b3-tooltips b3-tooltips__s"
                    max="100" min="40" step="1" type="range" value="${width}"
                    aria-label="${width}%" id=""
                />
                100%
            </div>
        </div>
        `
        super({
            title: `${plugin.i18n.title}: ${width}%`,
            content: dom,
            destroyCallback: () => {
                plugin.settingUtils.save();
                plugin.updateAllPadding();
            }
        });
        let header: HTMLDivElement = this.element.querySelector('.b3-dialog__header');
        let body: HTMLDivElement = this.element.querySelector('.b3-dialog__body');
        body.style.padding = "1rem";
        header.style.textAlign = "center";

        const inputCenterWidth: HTMLInputElement = this.element.querySelector('input.b3-slider');
        inputCenterWidth.addEventListener("input", (e) => {
            const width = parseInt((e.target as HTMLInputElement).value);
            plugin.settingUtils.set("width", width);

            header.innerText = `${plugin.i18n.title}: ${width}%`;
            inputCenterWidth.setAttribute("aria-label", `${width}%`);
            document.documentElement.style.setProperty('--centerWidth', `${width}%`);
        });
    }
}

