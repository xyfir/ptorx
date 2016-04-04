export = function (id: number, subscription: number, save: boolean): string {

    let action: string = "https://ptorx.com/api/receive/"
        + (Date.now() > subscription ? "free" : "paid")
        + "/" + id;

    if (save)
        action = `store(notify="${action}")`;
    else
        action = `forward("${action}")`

    return action;

};