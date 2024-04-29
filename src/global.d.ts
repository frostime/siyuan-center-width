/*
 * Copyright (c) 2024 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2023-12-17 18:28:36
 * @FilePath     : /src/global.d.ts
 * @LastEditTime : 2024-04-29 14:34:08
 * @Description  : 
 */

type TSettingItemType = "checkbox" | "select" | "textinput" | "textarea" | "number" | "slider" | "button" | "hint";
interface ISettingItem {
    key: string;
    value: any;
    type: TSettingItemType;
    title: string;
    description?: string;
    placeholder?: string;
    slider?: {
        min: number;
        max: number;
        step: number;
    };
    options?: { [key: string | number]: string };
    action?: {
        callback: () => void;
    }
    button?: {
        label: string;
        callback: () => void;
    }
    createElement?: (value: any) => HTMLElement;
}

declare interface Window {
    siyuan: {
        config: {
            system: {
                id: string;
            }
        }
    }
}
