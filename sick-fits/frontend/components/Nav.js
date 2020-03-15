import Link from "next/link";
import NavStyles from "./styles/NavStyles";
import User from './User';

const Nav = () => (
    /* Not reading the imported NavStyles.js "background" template literal correctly.  Why is that? */
    
        <User>
            {({data: { me }}) => (
                <NavStyles>
                    <Link href="/">
                        <a>Home</a>
                    </Link>
                    <Link href="/items">
                        <a>Items</a>
                    </Link>
                    {me && (
                        <>
                            <Link href="/sell">
                                <a>Sell!</a>
                            </Link>
                            <Link href="/orders">
                                <a>Orders</a>
                            </Link>
                            <Link href="/me">
                                <a>Account</a>
                            </Link>    
                        </>
                    )}
                    {!me && (
                        <Link href="/signup">
                            <a>Sign In</a>
                        </Link>
                    )}
                </NavStyles>
            )}
        </User>
   

);

export default Nav;