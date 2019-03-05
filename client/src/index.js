import ReactDOM from 'react-dom';
import createApp from './App';
import './index.scss';
import configureStore from './state/configureStore';

const store = configureStore();

ReactDOM.render(createApp(store), document.getElementById('root'));
