import React, {Component, PropTypes} from 'react';
import cx from 'classnames';

export default class Hello extends Component {
  static propTypes = {
    userName: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {message: 'Hello'};
  }
  componentDidMount() {
    setInterval(() => {
      let message;

      if (this.state.message === 'Hello') {
        message = 'whatevss';
      } else {
        message = 'Hello';
      }

      this.setState({message});
    }, 2000);
  }
  render() {
    const styles = require('./local.css');
    let classes = cx({
      'is-error': this.state.message === 'whatevss'
    });

    if (this.state.message === 'whatevss') {
      classes += ` ${styles.whatevss}`;
    } else {
      classes += ` ${styles.hello}`;
    }

    return <h1 className={classes}>{this.state.message} {this.props.userName}</h1>;
  }
}

