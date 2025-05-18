export const getStatusText = (status: string) => {
    switch(status){
        case 'TODO':
            return '待处理';
        case 'DOING':
            return '处理中';
        case 'DONE':
        default:
            return '已完成';
    }
}

export const getContryOptions = () => {
    return [];
}