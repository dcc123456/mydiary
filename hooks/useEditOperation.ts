import { ref } from 'vue';
const useEditOperation = () => {

  // 实现撤销、重做功能
  const history = ref<Array<string>>([]);
  const future = ref<Array<string>>([]);
  const content = ref('');
  const undo = () => {
    console.log('history', history.value);
    if (history.value.length > 0) {
      future.value.push(history.value.pop()!);
      content.value = history.value[history.value.length - 1]!;
    }
  };
  const redo = () => {
    console.log('future', future.value);
    if (future.value.length > 0) {
      history.value.push(future.value.pop()!);
      content.value = history.value[history.value.length - 1]!;
    }
  };
  const saveContent = (value: string) => {
    if (history.value.length === 0 || history.value[history.value.length - 1] !== value) {
      history.value.push(value);
      future.value = []; // 清空未来栈
      content.value = value;
    }
  };
  return {
    undo,
    redo,
    saveContent,
    content,
    canUndo: () => history.value.length > 0,
    canRedo: () => future.value.length > 0,

  };
};

export default useEditOperation;