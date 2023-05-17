import {Plugin, Dialog} from "siyuan";
import "./index.css";

const STORAGE_NAME = "menu-config";

export default class PluginSample extends Plugin {

    onload() {
        this.data[STORAGE_NAME] = {readonlyText: "Readonly"};

        const topBarElement = this.addTopBar({
            icon: "iconEmoji",
            title: this.i18n.addTopBarIcon,
            position: "right",
            callback: () => {
                
            }
        });
    }

    onunload() {
        console.log(this.i18n.byePlugin);
    }
}
