// stores/counter.js
import { defineStore } from 'pinia';
import { ref } from "vue";

export const useEditStore = defineStore('diaryContext', () => {
	const diaryContext = ref(null);
	// 也可以这样定义
	// state: () => ({ count: 0 })
	const setDiaryContext = (newVal : any) => {
		diaryContext.value = newVal
	}
	return {
		diaryContext,
		setDiaryContext,
	}
});