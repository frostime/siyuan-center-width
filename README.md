
- 使用前请关闭「自适应宽度」，即全宽模式
- 各个设备下的配置是独立的，需要分别设置


## 基本用法



- 点击 Icon 弹出对话框

  ![](asset/Icon.png)

- 拖动滑动条来调节宽度

  ![](asset/dialog.png)


- 标题, 正文, 挂件全适配

- 使用 `Alt+[-=]` 快捷键来调整宽度


![](asset/width-plugin.png)

## 两种宽度模式

- 百分比模式: 以百分比为单位
- 固定宽度模式: 以像素为单位

## 主编辑器与小窗口

- 思源的主编辑器与小窗口的宽度是独立的，可以分别设置
- 小窗口的宽度固定为百分比模式

## 两种运行模式

- 简单模式: 只插入 CSS 样式

  - 优点：非常轻量，对性能影响小
  - 缺点：无法对 iframe、挂件生效

- 复杂模式: CSS + JS

  - 优点：对 iframe、挂件生效
  - 缺点：性能开销更大
