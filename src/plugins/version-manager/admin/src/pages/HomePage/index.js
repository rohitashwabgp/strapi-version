import React, { memo, useState, useEffect } from 'react';
import { Layout } from '@strapi/design-system/Layout';
import { Box } from '@strapi/design-system/Box';
import { SubNav, SubNavHeader, SubNavSection, SubNavSections, SubNavLink } from '@strapi/design-system/SubNav';
import ExclamationMarkCircle from '@strapi/icons/ExclamationMarkCircle';
import { request, LoadingIndicatorPage } from "@strapi/helper-plugin";
import get from 'lodash/get';
import  ContentType  from '../ContentTypes';
import { useRouteMatch } from "react-router-dom";

const contentTypeRoutes = () => {
    return (<ContentType/>)
}

const HomePage = () => {
  const [singleTypesLinks, setSingleTypesLinks] = useState([]);
  const [collectionTypesLinks, setCollectionTypesLinks] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const { url } = useRouteMatch();


  useEffect(() => {
    request("/content-manager/content-types", { method: "GET" }).then(response => {
      response = get(response, 'data');
      const singleTypes = response.filter(data => data.kind === 'singleType' && data.isDisplayed);
      const collectionTypes = response.filter(data => data.kind === 'collectionType' && data.isDisplayed);
      singleTypes.forEach((singleType, index) => {
        singleTypesLinks.push({
          id: index,
          label: singleType.apiID,
          icon: <ExclamationMarkCircle />,
          slug: singleType.uid,
          type: "singleType",
          to: `${url}/singleType/${singleType.uid}?slug=${singleType.uid}`
        })
      })
      collectionTypes.forEach((collectionType, index) => {
        collectionTypesLinks.push({
          id: index,
          label: collectionType.apiID,
          icon: <ExclamationMarkCircle />,
          slug: collectionType.uid,
          type: "collectionType",
          to: `${url}/collectionType/${collectionType.uid}?slug=${collectionType.uid}`
        })
      })
      setSingleTypesLinks(singleTypesLinks);
      setCollectionTypesLinks(collectionTypesLinks);
      setLoading(false);
    });
  }, []);

  if (isLoading) {
    return <LoadingIndicatorPage />;
  }
  return (
    <Box background="neutral100">
      <Layout sideNav={<SubNav ariaLabel="Builder sub nav">
        <SubNavHeader searchable value={''} onClear={() => { }} onChange={e => { }} label="Content Types" searchLabel="Search..." />
        <SubNavSections>
          <SubNavSection label="Collection Type" collapsable badgeLabel={collectionTypesLinks.length.toString()}>
            {collectionTypesLinks && collectionTypesLinks.map(link =>
              <SubNavLink to={link.to} active={link.active} key={link.id}>
                {link.label}
              </SubNavLink>)}
          </SubNavSection>
          <SubNavSection label="Single Type" collapsable badgeLabel={singleTypesLinks.length.toString()}>
            {singleTypesLinks && singleTypesLinks.map(link =>
              <SubNavLink to={link.to} key={link.id}>
                {link.label}
              </SubNavLink>)}
          </SubNavSection>
        </SubNavSections>
      </SubNav>}>
        {contentTypeRoutes()}
      </Layout>
    </Box>);
}

export default memo(HomePage);
