<template>
    <div class="ui-menu">
        <a-menu :style="{ width: '200px', height: '100%' }" :default-open-keys="['0']" :default-selected-keys="['0_2']"
            show-collapse-button breakpoint="xl">
            <a-sub-menu key="0">
                <template #icon><icon-apps></icon-apps></template>
                <template #title>按键</template>
                <a-sub-menu key="0_0" title="触摸单击">
                    <a-menu-item key="0_0_0">坐标</a-menu-item>
                    <a-menu-item key="0_0_1">文字</a-menu-item>
                    <a-menu-item key="0_0_2">资源ID</a-menu-item>
                </a-sub-menu>
                <a-menu-item key="0_1">触摸按下</a-menu-item>
                <a-menu-item key="0_2">触摸拖动</a-menu-item>
            </a-sub-menu>
            <a-sub-menu key="2">
                <template #icon><icon-bug></icon-bug></template>
                <template #title>循环</template>
                <a-menu-item key="2_1">空循环(等待)</a-menu-item>
                <a-menu-item key="2_2">无限循环</a-menu-item>
                <a-menu-item key="2_3">按次循环</a-menu-item>
                <a-menu-item key="2_4">限时循环</a-menu-item>
            </a-sub-menu>
            <a-sub-menu key="3">
                <template #icon><icon-bulb></icon-bulb></template>
                <template #title>功能</template>
                <a-menu-item key="2_0">跳出循环</a-menu-item>
                <a-menu-item key="2_0">结束本次循环</a-menu-item>
            </a-sub-menu>
        </a-menu>
    </div>
</template>

<style lang="less" scoped>
.ui-menu {
    height: 70vh;
}
</style>
