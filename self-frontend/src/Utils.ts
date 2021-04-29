function dateToString(date: Date): string {
    return date.toLocaleDateString().split('/').reverse().join('-');
}

export {dateToString}
