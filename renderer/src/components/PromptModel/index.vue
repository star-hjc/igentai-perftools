<template>
    <a-modal ref="modalRef" v-bind="$attrs">
        <template v-for=" (value, name) in $slots" #[name]="scopeData">
            <slot :name="name" v-bind="scopeData || {}" />
        </template>
    </a-modal>
</template>


<script setup>
const modalRef = ref(null)
defineExpose(modalRef.value)
</script>