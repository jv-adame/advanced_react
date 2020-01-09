import SignUp from '../components/SignUp';
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
            <SignUp />
            <SignUp />
        </div>
    </Columns>
);

export default SignupPage;