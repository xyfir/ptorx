export default function() {

    let options = {
        url: "", fn: () => {}, method: "GET", data: {}, dataType: "json"
    };

    // request("url", (res) => {})
    if (typeof arguments[0] == "string") {
        options.url = arguments[0];
        options.fn = arguments[1];
    }
    // request({ url, success|fn, ?method, ?data, ?dataType })
    else if (arguments.length == 1) {
        Object.assign(options, arguments[0]);

        // Old version used success() for callback
        if (options.success) options.fn = options.success;
    }
    // request({ url, ?method, ?data, ?dataType }, (res) => {})
    else {
        Object.assign(options, arguments[0]);
        options.fn = arguments[1];
    }
    
    let request = new XMLHttpRequest();
    
    // Set method and URL
    request.open(options.method, options.url, true);
    
    // Handle response
    request.onload = function() {
        if (this.status >= 200 && this.status < 400) {
            switch (options.dataType) {
                case "text":
                    options.fn(this.responseText, this.status); break;
                default:
                    options.fn(JSON.parse(this.responseText), this.status);
            }
        }
    };
    
    // Send request + data
    if (options.method == "GET") {
        request.send();
    }
    else {
        const query =
            Object.keys(options.data).map(key => {
                return key + "=" + encodeURIComponent(options.data[key]);
            }).join("&");
        
        request.setRequestHeader(
            "Content-Type", "application/x-www-form-urlencoded"
        );
        request.send(query);
    }
    
};