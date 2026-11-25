import { lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { RootLayout } from '@/layouts/RootLayout';
import { MotionConfig } from 'framer-motion';
import { SmoothScroll } from '@/components/common/SmoothScroll';

// Route-level code splitting.
const Home = lazy(() => import('@/pages/Home'));
const About = lazy(() => import('@/pages/About'));
const Products = lazy(() => import('@/pages/Products'));
const ProductDetail = lazy(() => import('@/pages/ProductDetail'));
const Ingredients = lazy(() => import('@/pages/Ingredients'));
const Process = lazy(() => import('@/pages/Process'));
const Quality = lazy(() => import('@/pages/Quality'));
const Contact = lazy(() => import('@/pages/Contact'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      { path: 'products', element: <Products /> },
      { path: 'products/:slug', element: <ProductDetail /> },
      { path: 'ingredients', element: <Ingredients /> },
      { path: 'process', element: <Process /> },
      { path: 'quality', element: <Quality /> },
      { path: 'contact', element: <Contact /> },
      { path: '*', element: <NotFound /> },
    ],
  },
], {
  future: {
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true,
  },
});

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll>
        <RouterProvider router={router} future={{ v7_startTransition: true }} />
      </SmoothScroll>
    </MotionConfig>
  );
}
