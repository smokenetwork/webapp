/* eslint react/prop-types: 0 */
import React, {Component} from 'react';
import { Link } from 'react-router';
import {connect} from 'react-redux'
import user from "../../redux/User";

class EligibleDialog extends Component {

    constructor() {
        super();
        this.readnContinue = this.readnContinue.bind(this);
    }

    readnContinue(e) {
        this.props.hideEligible();
        window.location.href = window.location.href;
    }

    static propTypes = {

    };

    render() {
        return (
            <div>
                <h4>Are you eligible to visit smoke.io?</h4>
                I am at least 21 years old or a valid medical marijuana patient and agree to the <Link to='/tos.html'>Terms of Service</Link> and <Link to='/privacy.html'>Privacy Policy</Link>.
                <hr />
                <button type="submit" className="button" onClick={this.readnContinue}>
                    Continue
                </button>
            </div>
        )
    }
}

export default connect(
    state => {
        return {
        }
    },
    dispatch => ({
        hideEligible: e => {
            if (e) e.preventDefault();

            if (process.env.BROWSER) {
                localStorage.setItem('user/show_eligible_modal', JSON.stringify(false));
            }

            dispatch(user.actions.hideEligible())
        }
    })
)(EligibleDialog)
