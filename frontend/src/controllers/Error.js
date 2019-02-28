import React from 'react';
import Controller from "../util/Controller";
import {generateLink} from "../util/serviceWorkerHelpers";

const errorMessages = {
    400: ["User error", "Make sure the URL is correct."],
    404: ["Not found", "We couldn't find that page."]
};

class Error extends Controller {
    constructor(props) {
        super(props);
        this.addScopedMethod(/(\d{3})/, this.runPage.bind(this));
    }


    runPage(code) {
        const [title, message] = errorMessages[code] || ["Something happened", "We're not quite sure what."];
        return (
            <>
                <h2>{title}</h2>
                <p>{message}</p>
                <p>Try going <a href={generateLink("/")}>home</a>.</p>
            </>
        );
    }
}

export default Error;