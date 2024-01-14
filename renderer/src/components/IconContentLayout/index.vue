<!-- eslint-disable no-undef -->
<template>
  <div class="icon-layout">
    <slot name="before" />
    <a-tooltip v-if="content" :content="content" >
      <component :is="icon"   @click="onIconClick" />
      <icon-settings />
    </a-tooltip>
    <component v-else :is="icon" :size="size" :color="color" @click="onIconClick"/>
    <slot />
  </div>
</template>

<script setup>
defineOptions({ name: 'IconContentLayout' })
const emits = defineEmits(['onIconClick'])
defineProps({
  icon: {
    type: String,
    required: true
  },
  content: {
    type: [String, Number],
    default: ''
  },
  size: {
    type: String,
    default: '20'
  },
  color: {
    type: String,
    default: ''
  }
})

function onIconClick() {
  emits('onIconClick')
}
</script>

<style lang="less" scoped>
.icon-layout {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;

}
</style>
