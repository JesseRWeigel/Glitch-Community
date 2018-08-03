import React from 'react';
import PropTypes from 'prop-types';

const {Provider, Consumer} = React.createContext();
const KEY = 'community-userPrefs';

class LocalStorage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: undefined};
    this.handleStorage = this.handleStorage.bind(this);
  }
  
  handleStorage() {
    let value;
    try {
      value = JSON.parse(window.localStorage[this.props.key]);
    } catch (error) {
      console.error('Failed to read from localStorage!');
      value = undefined;
    }
    this.setState({value});
  }
  
  componentDidMount() {
    window.addEventListener('storage', this.handleStorage, {passive: true});
    this.handleStorage();
  }
  
  componentWillUnmount() {
    window.removeEventListener('storage', this.handleStorage, {passive: true});
  }
  
  set(value) {
    try {
      window.localStorage[this.props.key] = value;
    } catch (error) {
      console.error('Failed to write to localStorage!');
    }
    this.setState({value});
  }
  
  render() {
    return this.props.children(this.state.value, this.set.bind(this));
  }
}
UserPref.propTypes = {
  children: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  default: PropTypes.any.isRequired,
  setUserPref: PropTypes.func.isRequired,
  getUserPref: PropTypes.func.isRequired,
};

export default UserPref;