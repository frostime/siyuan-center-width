
function insertStyle(id: string, style: string) {
    let styleEle = document.createElement("style");
    styleEle.id = id;
    styleEle.innerHTML = style;
    document.head.appendChild(styleEle);
}

function removeStyle(id: string) {
    let styleEle = document.getElementById(id);
    if (styleEle) {
        styleEle.remove();
    }
}

export { insertStyle, removeStyle };
