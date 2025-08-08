import ReactPullToRefresh from 'react-pull-to-refresh';



export default function PullToReload({ children }) {
return (
<ReactPullToRefresh
onRefresh={() => {
window.location.reload();
return Promise.resolve(); // satisfies component contract
}}
style={{ minHeight: '100%', display: 'block' }}
>
{children}
</ReactPullToRefresh>
);
}