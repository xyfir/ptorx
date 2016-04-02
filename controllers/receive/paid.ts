export = function (req, res) {

    /*
        - Grab filters for email + modifiers + redirect email + save_mail
        - Loop through filters
        - If email passes through filters, send to redirect if available
            - Run content through any available modifiers
        - If email did not pass and save_mail === true, delete it from MailGun's storage
    */

};