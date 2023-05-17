import { Plugin, Dialog } from "siyuan";
import "./index.scss";

const STORAGE_NAME = "menu-config";

class ChangeWidthDialog extends Dialog {

    value: number;

    constructor() {
        let dom = `
        <input class="b3-slider fn__size200" id="centerWidth" max="100" min="50" step="1" type="range" value="70"/>
        `
        super({
            title: "更改中央面板宽度",
            content: dom,
        });
        this.element.querySelector("#centerWidth").addEventListener("input", (e) => {
            console.log(e);
            let width: number = parseInt((e.target as HTMLInputElement).value);
            console.log(width);
        });
    }
}

export default class PluginSample extends Plugin {

    onload() {
        this.data[STORAGE_NAME] = { readonlyText: "Readonly" };

        const topBarElement = this.addTopBar({
            icon: "iconEmoji",
            title: this.i18n.addTopBarIcon,
            position: "right",
            callback: () => {
                let dialog = new ChangeWidthDialog();
            }
        });
    }

    onunload() {
        console.log(this.i18n.byePlugin);
    }
}
