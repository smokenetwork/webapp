import React, {Component} from 'react';

class ServerError extends Component {

    render() {
        return (
            <div className="float-center" style={{width: '640px', textAlign: 'center'}}>
                <img width="640px" height="480px" src="/images/501.jpg" />
                <div>
                    <h4>Sorry.</h4>
                    <p>Looks like something went wrong on our end.</p>
                    <p>Head back to <a href="/">Smoke</a> homepage.</p>
                </div>
            </div>
        );
    }

}

export default ServerError;
