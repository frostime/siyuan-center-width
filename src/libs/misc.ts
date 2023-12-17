/*
 * Copyright (c) 2023 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2023-12-17 18:33:01
 * @FilePath     : /src/libs/misc.ts
 * @LastEditTime : 2023-12-17 18:33:17
 * @Description  : 
 */
export function throttle<T extends Function>(func: T, wait: number = 500){
    let previous = 0;
    return function(){
        let now = Date.now(), context = this, args = [...arguments];
        if(now - previous > wait){
            func.apply(context, args);
            previous = now;
        }
    }
}

