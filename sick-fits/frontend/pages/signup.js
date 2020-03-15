import SignUp from '../components/SignUp';
import SignIn from '../components/SignIn';
import styled from 'styled-components';

const Columns = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    grid-gap: 20px;
`;
const SignupPage = props =>(
    <Columns>   
        <div>
            <SignUp />
            <SignIn />
        </div>
    </Columns>
);

export default SignupPage;