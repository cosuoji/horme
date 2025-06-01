// components/BlogLayout.js
import { Outlet } from 'react-router-dom';

const BlogLayout = () => {
  return (
    <div className="blog-layout">
      <Outlet /> {/* This renders the nested routes */}
    </div>
  );
};

export default BlogLayout;