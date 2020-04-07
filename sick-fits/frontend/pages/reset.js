import CreateItem from '../components/CreateItem';
const Sell = props =>(
    <div>
        <p>Reset Your Password {props.query.resetToken}</p>
        <Reset resetToken={props.query.resetToken} />
    </div>
);

export default Sell;