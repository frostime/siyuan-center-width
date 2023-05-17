
- 使用前请关闭「自适应宽度」，即全宽模式
- 在部分主题中，本插件无效，如：Rem Craft

## 基本用法



- 点击 Icon 弹出对话框

  ![](asset/Icon.png)

- 拖动滑动条来调节宽度

  ![](asset/dialog.png)

  你在拖动的时候可能会发现比较卡，如果你嫌操作卡手，可以使用左右键盘来微调

## 你完全可以不安装这个插件

这个插件代码非常简单，如果你嫌弃多占用一个位置，完全可以把下面的代码复制到自己的代码片段里，然后卸载这个飞舞插件。

```css
:root {
    --centerWidth: 70%;
    --lrwidth: calc((100% - var(--centerWidth)) / 2);
}

div.protyle-content:not([data-fullwidth="true"])>div.protyle-title {
    margin-left: var(--lrwidth) !important;
    margin-right: var(--lrwidth) !important;
}

div.protyle-content:not([data-fullwidth="true"])>div.protyle-wysiwyg {
    padding-left: var(--lrwidth) !important;
    padding-right: var(--lrwidth) !important;
}
```
