import React from 'react';

class Claim extends React.Component {
  render() {
    return (
      <div className="Claim row">
        <div className="column large-12">
          <br/>

          <br/>
          <div>
            <h2>Pre-Sale Claim (Bitshares SMOKE UIA Holders)</h2>
            <br/>
            <p>
              <span className="section">1: </span>
              If you have not already created a Smoke account, create an account on the Smoke blockchain <a
              href="/pick_account" target="_blank">now</a>.
            </p>
            <p>
              <span className="section">2: </span>
              Go to our claim tool and follow the instructions: <a href="https://claim.smoke.io/"
                                                                   target="_blank">https://claim.smoke.io/</a>
            </p>
          </div>
          <br/>
          <div>
            <h2>Main ICO Claim (ICO Dashboard Smoke Holders)</h2>
            <br/>
            <p>
              <span className="section">1: </span>
              If you have not already created a Smoke account, create an account on the Smoke blockchain <a
              href="/pick_account" target="_blank">now</a>.
            </p>
            <p>
              <span className="section">2: </span>
              Sign into your Smoke ICO dashboard (<a href="https://ico.smoke.network/user/"
                                                     target="_blank">https://ico.smoke.network/user/</a>) and click `My
              Profile` and then `My Wallet`.
            </p>
            <p>
              <span className="section">3: </span>
              Enter your Smoke username and click save. Your coins will automatically be sent after the claim date.
            </p>
          </div>
          <br/>
          <div>
            <h2>Airdrop Participants</h2><br/>
            <p>
              <span className="section"> </span>
              The airdrop claim will start once Pre-Sale and ICO users have claimed their stake in the network or on
              December 1st whichever comes sooner.
              Please keep an eye on your email for more information in the coming weeks.
            </p>
          </div>


        </div>
      </div>
    );
  }
}

module.exports = {
  path: 'claim.html',
  component: Claim
};
