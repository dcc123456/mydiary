interface DiaryItem{
    id: number,
    title: string,
    desc: string,
    class_name: string,
    top: 0|1,
    path: string,
    created_at: number,
    updated_at: number
}

export{
  DiaryItem
}