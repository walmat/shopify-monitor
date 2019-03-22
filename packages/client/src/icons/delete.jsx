import React from 'react';
import * as feather from 'feather-icons';

class FeatherIcon extends React.PureComponent {
  componentDidMount() {
    feather.replace();
  }

  render() {
    const { icon, ...otherProps } = this.props;
    return <span data-feather={icon || 'alert-triangle'} {...otherProps} />;
  }
}

export default FeatherIcon;
