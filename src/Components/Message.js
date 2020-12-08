import React from 'react';
import { Alert } from 'react-bootstrap';
import { Check, X } from 'react-bootstrap-icons';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Button from 'react-bootstrap/Button';
import Fade from 'react-bootstrap/Fade';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { setLoginObject, setRestaurantObject } from '../redux/actions/actions';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const ms = require('pretty-ms');

class Message extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.acknowledgeOrder = this.acknowledgeOrder.bind(this);
    this.clearOrder = this.clearOrder.bind(this);
    this.warnLateOrder = this.warnLateOrder.bind(this);

    const Config = require('../config.json');

    this.honktimeout = null;

    this.state = {
      Config,
      API: Config.apiAddress,
      show: true,
      variant: '',
      message: {},
      time: 0,
      start: 0,
      isOn: false,
      arrived: '',
      id: null
    };
  }

  componentDidMount() {
    this.warnLateOrder();
    if (this.props.msg) {
      let milliseconds = Date.now();
      if (this.props.msg.ats) {
        milliseconds = this.props.msg.ats * 1000;
      }
      const dateName = new Date().getTime() * 1000;
      let variant = 'warning';
      if (this.props.msg.status === 'acknowledged') {
        variant = 'success';
      }

      this.setState({
        variant: variant,
        message: this.props.msg,
        isOn: true,
        time: dateName,
        arrived: Date.now(),
        start: milliseconds - this.state.time
      });
      this.timer = setInterval(() => this.setState({
        time: Date.now() - this.state.start
      }), 1000);
    }

  }

  componentWillUnmount() {
    this.setState({
      variant: '',
      message: {},
      time: 0,
      start: 0,
      isOn: false
    });
    clearInterval(this.timer);
    clearTimeout(this.honktimeout);
  }

  warnLateOrder() {
    this.honktimeout = setTimeout(() => {
      this.setState({
        variant: 'danger'
      });

    }, 1000 * 90);
  }

  acknowledgeOrder() {
    this.props.removeMessage(this.props.msg.linkID, 'acknowledgeGuest');
    this.warnLateOrder();
    this.setState({
      variant: 'success',
      id: this.props.msg.linkID
    });
  }

  clearOrder() {
    this.props.removeMessage(this.props.msg.linkID, 'clearGuest');
  }

  render() {
    if (this.props.msg) {
      let variant = 'warning';
      if (Date.now() - this.state.start <= 90000) {
        if (this.props.msg && this.props.msg.status === 'acknowledged') {
          variant = 'success';
        }
      } else {
        variant = 'danger';
      }

      return (
        <Fade>
          <Alert variant={variant}>
            <Row>
              <Col sm={11}>
                <Alert.Heading>
                  <strong>
                    {this.props.msg.guest} Order # {this.props.msg.check}
                    {this.props.restaurant.id && this.props.restaurant.id === '-1' ?
                      (
                        <>
                          &nbsp; ({this.props.msg.restaurantName})
                        </>
                      ) : (<></>)}
                  </strong>
                </Alert.Heading>
                <p>Arrived: {this.props.msg.arrived}</p>
                <h5><strong>Waiting: {ms(Math.round(this.state.time / 1000) * 1000)}</strong></h5>
                <hr/>
                <p className="mb-0"><strong>Vehicle Information:</strong></p>
                {this.props.msg.car && this.props.msg.car.map((entry, i) => {
                  return (
                    <p key={'mod_' + i}>{entry}</p>
                  );
                })

                }
              </Col>
              <Col sm={1} style={{ position: 'absolute', right: '10px' }}>
                {this.props.restaurant.id && this.props.restaurant.id !== '-1' ? (
                  <ButtonGroup>
                    {this.props.msg.status === 'arrived' ? (
                      <Button variant="link" onClick={this.acknowledgeOrder}><Check className={'text-success'} size={48}/></Button>
                    ) : (
                      <Button variant="link"><X className={'text-danger'} onClick={() => this.clearOrder()} size={48}/></Button>
                    )
                    }
                  </ButtonGroup>
                ) : (<></>)
                }
              </Col>
            </Row>
          </Alert>
        </Fade>
      );
    } else {
      return (<></>);
    }
  }
}

const mapStateToProps = (state) => {
  return {
    loggedIn: state.loggedIn,
    restaurant: state.restaurant
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setLoginObject: (loggedIn) => {
      dispatch(setLoginObject(loggedIn));
    },
    setRestaurantObject: (restaurant) => {
      dispatch(setRestaurantObject(restaurant));
    }
  };
};

Message.propTypes = {
  loggedIn: PropTypes.object,
  setLoginObject: PropTypes.func.isRequired
};

export default connect(mapStateToProps, mapDispatchToProps)(Message);
