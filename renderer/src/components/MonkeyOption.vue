<template>
    <div class="top">
        <span>日志等级：</span>
        <a-select v-model="logLevel" size="mini" placeholder="日志等级...">
            <a-option value="-v" label="简单" />
            <a-option value="-v -v" label="普通" />
            <a-option value="-v -v -v" label="详情" />
        </a-select>
        <span>运行次数：</span>
        <a-input-number v-model="runNum" :min="1" :max="9999999999" size="mini" placeholder="运行次数..." />
        <span>间隔时间(ms)：</span>
        <a-input-number v-model="throttle" :min="0" size="mini" placeholder="间隔时间..." />
        <span>随机种子：</span>
        <a-input-number v-model="seed" :min="0" size="mini" placeholder="随机种子..." />
    </div>
    <div class="event">
        <span class="title">事件</span>
        <a-form :model="event">
            <a-row>
                <a-col :span="6">
                    <a-form-item label="触摸">
                        <a-input-number v-model="event.touch" :min="0" :max="100" @blur="onInputEventNum('touch')"
                            size="mini" />
                    </a-form-item>
                </a-col>
                <a-col :span="6">
                    <a-form-item label="滑动">
                        <a-input-number v-model="event.motion" :min="0" :max="100" @blur="onInputEventNum('motion')"
                            size="mini" />
                    </a-form-item>
                </a-col>
                <a-col :span="6">
                    <a-form-item label="轨迹球">
                        <a-input-number v-model="event.trackball" :min="0" :max="100" @blur="onInputEventNum('trackball')"
                            size="mini" />
                    </a-form-item>
                </a-col>
                <a-col :span="6">
                    <a-form-item label="导航">
                        <a-input-number v-model="event.nav" :min="0" :max="100" @blur="onInputEventNum('nav')"
                            size="mini" />
                    </a-form-item>
                </a-col>
            </a-row>
            <a-row>
                <a-col :span="6">
                    <a-form-item label="应用切换">
                        <a-input-number v-model="event.appswitch" :min="0" :max="100" @blur="onInputEventNum('appswitch')"
                            size="mini" />
                    </a-form-item>
                </a-col>
                <a-col :span="6">
                    <a-form-item label="系统按键">
                        <a-input-number v-model="event.syskeys" :min="0" :max="100" @blur="onInputEventNum('syskeys')"
                            size="mini" />
                    </a-form-item>
                </a-col>
                <a-col :span="6">
                    <a-form-item label="主要导航">
                        <a-input-number v-model="event.majornav" :min="0" :max="100" @blur="onInputEventNum('majornav')"
                            size="mini" />
                    </a-form-item>
                </a-col>
                <a-col :span="6">
                    <a-form-item label="任意事件">
                        <a-input-number v-model="event.anyevent" :min="0" :max="100" @blur="onInputEventNum('anyevent')"
                            size="mini" />
                    </a-form-item>
                </a-col>
            </a-row>
        </a-form>
    </div>
    <div style="display: flex;">
        <div style="width: 25%">
            <span class="title">选择包</span>
            <div style="display: flex;justify-content: space-around;">
                <a-radio-group size="large">
                    <a-radio value="0">全部</a-radio>
                    <a-radio value="1">选择</a-radio>
                    <a-radio value="2">忽略</a-radio>
                </a-radio-group>
                <a-button type="outline" @click="handleClick">选择包(?)</a-button>
                <a-modal width="auto" v-model:visible="visible" @ok="handleOk" @cancel="handleCancel">
                    <template #title>
                        选择包
                    </template>
                    <div>
                        <a-transfer show-search :data="data" :default-value="value">
                            <template #source-title="{
                                countTotal,
                                countSelected,
                                checked,
                                indeterminate,
                                onSelectAllChange,
                            }">
                                <div :style="styleHeader">
                                    忽略 {{ countSelected }}-{{ countTotal }}
                                    <a-checkbox :model-value="checked" :indeterminate="indeterminate"
                                        @change="onSelectAllChange" />
                                </div>
                            </template>

                            <template #target-title="{ countTotal, countSelected, indeterminate }">
                                <div :style="styleHeader">
                                    执行 {{ countSelected }}-{{ countTotal }}
                                    <a-checkbox :model-value="checked" :indeterminate="indeterminate"
                                        @change="onSelectAllChange" />
                                </div>
                            </template>
                        </a-transfer>
                    </div>
                </a-modal>
            </div>
        </div>
        <div style="width: 75%;display: flex;justify-content: center;align-items: center;">
            <a-checkbox-group v-model="ignore">
                <a-checkbox value="--ignore-crashes">忽略崩溃(不建议)</a-checkbox>
                <a-checkbox value="--ignore-timeouts">忽略超时(不建议)</a-checkbox>
                <a-checkbox value="--ignore-security-exceptions">忽略权限错误(建议)</a-checkbox>
                <a-checkbox value="--kill-process-after-error">发生错误后终止应用程序进程</a-checkbox>
                <a-checkbox value="--monitor-native-crashes">监视并报告代码中发生的崩溃</a-checkbox>
                <a-checkbox value="--hprof"> Monkey事件序列分析报告(不建议)</a-checkbox>
            </a-checkbox-group>
        </div>
    </div>
</template>

<script setup>
const ignore = ref(['--ignore-security-exceptions', '--kill-process-after-error', '--monitor-native-crashes'])
const event = reactive({
    touch: 70,
    motion: 20,
    trackball: 0,
    nav: 0,
    appswitch: 10,
    syskeys: 0,
    majornav: 0,
    anyevent: 0,
});
const value = ['option1', 'option3', 'option5'];
const visible = ref(false);
const handleClick = () => {
    visible.value = true;
};
const handleOk = () => {
    visible.value = false;
};
const handleCancel = () => {
    visible.value = false;
}
const data = Array(8)
    .fill(undefined)
    .map((_, index) => ({
        value: `option${index + 1}`,
        label: `Option ${index + 1}`,
    }));


const styleHeader = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: '8px'
};
</script>

<style lang="less" scoped>
.title {
    margin-left: 10px;
    font-size: 15px;
    font-weight: bold;
}

.top {
    span {
        white-space: nowrap;
    }

    span+span {
        margin-left: 10px;
    }

    box-sizing: border-box;

    display: flex;
    align-items: center;
    margin:10px;
}
</style>