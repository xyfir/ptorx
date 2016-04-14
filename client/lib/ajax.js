export default function (options) {
    let request = new XMLHttpRequest();
    
    // Set method and URL
    request.open(options.method || "GET", options.url, true);
    
    // Handle response
    request.onload = function () {
        if (this.status >= 200 && this.status < 400) {
            switch (options.dataType) {
                case "text":
                    options.success(this.responseText, this.status); break;
                default:
                    options.success(JSON.parse(this.responseText), this.status);
            }
        }
        else if (options.error) {
            options.error(this.responseText, this.status);
        }
    };
    
    // Set session cookie
    request.withCredentials = true;
    let session = document.cookie.replace(/(?:(?:^|.*;\s*)connect.sid\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    request.setRequestHeader("Cookie", "connect.sid=" + session);
    
    // Send request + data
    if (options.method == undefined || options.method == "GET") {
        request.send();
    }
    else {
        let query = "";
        
        for (let key in options.data) {
            query += encodeURIComponent(key) + "=" + encodeURIComponent(options.data[key]) + "&";
        }
        
        query = query.substr(0, query.length - 1);
        
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.send(query);
    }
};