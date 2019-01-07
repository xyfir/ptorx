import { Button, Slider, Divider } from 'react-md';
import * as React from 'react';
import * as copy from 'copyr';
import { api } from 'lib/api';

// Actions
import { updateCredits } from 'actions/account';

// Constants
import { COINHIVE_KEY } from 'constants/config';

export default class EarnCredits extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hps: 0,
      earned: 0,
      hashes: 0,
      mining: false,
      threads: 4,
      throttle: 0.3
    };
  }

  componentDidMount() {
    const { App } = this.props;
    const s = this.state;

    // Load miner
    if (!window.CoinHive) {
      const script = document.createElement('script');
      script.src = 'https://authedmine.com/lib/authedmine.min.js';
      document.head.appendChild(script);

      // Wait for script to load
      this.interval = setInterval(() => {
        if (!window.CoinHive) return;

        clearInterval(this.interval);
        window.miner = this.miner = new window.CoinHive.User(
          COINHIVE_KEY,
          App.state.account.uid,
          {
            threads: s.threads,
            throttle: s.throttle
          }
        );

        this._addListeners();
      }, 250);
    }
    // Miner already loaded, get info
    else {
      this.miner = window.miner;
      this.setState(this._getStats());
      this._addListeners();
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
    clearInterval(this.interval2);
  }

  /** Start/stop miner */
  onToggle() {
    /** @type {boolean} */
    const isRunning = this.miner.isRunning();

    if (isRunning) this.miner.stop();
    else this.miner.start();

    this.setState({ mining: !isRunning });
  }

  /** @param {number} threads */
  onSetThreads(threads) {
    this.miner.setNumThreads(threads);
    this.setState({ threads });
  }

  /** @param {number} throttle */
  onSetThrottle(throttle) {
    this.miner.setThrottle(throttle);
    this.setState({ throttle });
  }

  _getStats() {
    return {
      hps: this.miner.getHashesPerSecond(),
      mining: this.miner.isRunning(),
      hashes: this.miner.getTotalHashes(),
      threads: this.miner.getNumThreads(),
      throttle: this.miner.getThrottle()
    };
  }

  _addListeners() {
    this.miner.on('error', console.error);

    this._checkEarnings();
    this.interval = setInterval(() => this.setState(this._getStats()), 1000);
    this.interval2 = setInterval(() => this._checkEarnings(), 60 * 1000);
  }

  async _checkEarnings() {
    const res = await api.get(`/account/credits/coinhive`);
    const { earned, credits } = res.data;
    this.setState({ earned });
    if (typeof credits == 'number')
      this.props.App.dispatch(updateCredits(credits));
  }

  render() {
    const { App } = this.props;
    const { account } = App.state;
    const s = this.state;

    return (
      <section className="earn-credits">
        <h2>Earn Credits</h2>

        <h3>Referral Program</h3>
        <p>Refer new users to Ptorx and you'll both receive free credits!</p>

        <Button
          flat
          primary
          iconChildren="content_copy"
          onClick={() => copy(`https://ptorx.com/?r=user~${account.uid}`)}
        >
          Copy Link
        </Button>

        <Divider />

        <h3>Miner</h3>
        <p>
          Use your processing power to generate credits! By starting the miner
          below, Ptorx will use your CPU to mine Monero, a cryptocurrency, which
          will in turn pay for credits that will be added to your account as the
          miner runs.
        </p>
        <p>
          This will increase your battery usage if you're on a mobile device,
          and it's generally not recommended to run the miner on a phone or a
          tablet, although it'll usually still work.
        </p>
        <p>
          Once started, the miner will continue to run as you use Ptorx until
          you close Ptorx or stop the miner.
        </p>
        <p>
          More threads means more CPU usage and more credits earned. More
          throttling means less CPU usage, and less credits earned.
        </p>

        <Slider
          discrete
          id="thread-slider"
          min={1}
          max={8}
          step={1}
          label={`Threads (${s.threads})`}
          value={s.threads}
          onChange={v => this.onSetThreads(v)}
          discreteTicks={1}
        />

        <Slider
          id="throttle-slider"
          min={0}
          max={1}
          step={0.05}
          label={`Throttle (${s.throttle * 100}%)`}
          value={s.throttle}
          onChange={v => this.onSetThrottle(v)}
        />

        <ul className="miner-stats">
          <li>You currently have {App.state.account.credits} credits</li>
          <li>{s.hashes} total hashes</li>
          <li>{s.hps.toFixed(2)} hashes per second</li>
          <li>{s.earned} credits earned</li>
        </ul>

        <Button
          raised
          primary
          onClick={() => this.onToggle()}
          iconChildren={`${s.mining ? 'pause' : 'play'}_circle_outline`}
        >
          {s.mining ? 'Stop' : 'Start'}
        </Button>
      </section>
    );
  }
}
