import React, { memo, useCallback, useState, useEffect } from 'react';
import { ActionLayout, HeaderLayout, ContentLayout } from '@strapi/design-system/Layout';
import { Button } from '@strapi/design-system/Button';
import { Table, Thead, Tbody, Tr, Td, Th, TFooter } from '@strapi/design-system/Table';
import { Typography } from '@strapi/design-system/Typography';
import { VisuallyHidden } from '@strapi/design-system/VisuallyHidden';
import { BaseCheckbox } from '@strapi/design-system/BaseCheckbox';
import { IconButton } from '@strapi/design-system/IconButton';
import { Flex } from '@strapi/design-system/Flex';
import Pencil from '@strapi/icons/Pencil';
import { request } from "@strapi/helper-plugin";
import _ from 'lodash';
import { PreviousLink, PageLink, NextLink, Pagination } from '@strapi/design-system/Pagination';
import { NavLink } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { ModalLayout, ModalBody, ModalHeader, ModalFooter } from '@strapi/design-system/ModalLayout';
import ReactDiffViewer, { DiffMethod } from "react-diff-viewer";

const newStyles = {
    variables: {
        light: {
            codeFoldGutterBackground: "#6F767E",
            codeFoldBackground: "#E2E4E5"
        }
    }
};

const ContentType = () => {
    const [checkedItems, setCheckedItems] = useState(new Map());
    const [tHeads, setTHeads] = useState([]);
    const [tData, setTData] = useState([]);
    const { search } = useLocation();
    const [checkedItemIndex, setCheckedItemIndex] = useState([]);
    const [isComapreVisible, setCompareIsVisible] = useState(false);

    useEffect(() => {
        const slug = new URLSearchParams(search).get("slug");
        request(`/version-manager/versions/content-types/${slug}`, { method: "GET" }).then(contentTypes => {
            setTHeads(Object.keys(contentTypes && !_.isEmpty(contentTypes[0]) ? contentTypes[0] : []));
            setTData(contentTypes);
            setCheckedItems(new Map());
            setCheckedItemIndex([])
        })
    }, [search]);

    const checkContentTypes = useCallback((data, index, value) => {
        let tempItemIndex = checkedItemIndex;
        if (value) {
            checkedItems.set(index, data);
            tempItemIndex.push(index);
            if (tempItemIndex.length >= 3) {
                const itemToRemove = tempItemIndex.shift();
                checkedItems.delete(itemToRemove);
            }
        } else {
            tempItemIndex = tempItemIndex.filter(function (ele) {
                return ele != index;
            });
            checkedItems.delete(index);
        }
        setCheckedItems(new Map(checkedItems));
        setCheckedItemIndex(tempItemIndex);
    }, [checkedItems, checkedItemIndex ])

    const tableData = () => {
        return tData.map((data, index) => {
            return (
                <Tr >
                    <Td><BaseCheckbox aria-label={`Select ${data[tHeads[0]]}`}
                        onValueChange={(value) => checkContentTypes(data, index, value)} value={checkedItems.get(index)} /></Td>
                    {tHeads.map((head) => {
                        if (_.isObject(data[head])) {
                            return <Td><Typography textColor="neutral800">{
                                "-"
                                // JSON.stringify(data[head])
                            }</Typography></Td>
                        } else {
                            return <Td><Typography textColor="neutral800">{data[head]}</Typography></Td>
                        }
                    })}
                    <Td><Flex>
                        <IconButton onClick={() => console.log('edit')} label="Compare with Active" icon={<Pencil />} />
                    </Flex></Td>
                </Tr>
            )
        })
    }

    const tHeadData = () => {
        return tHeads.map((head) => {
            return <Th> <Typography variant="sigma">{head}</Typography></Th>
        })
    }


    const compareModal = (version1, version2) => {
        return (<>
            {isComapreVisible && <ModalLayout onClose={() => setCompareIsVisible(prev => !prev)} labelledBy="Version Compare"
                style={{ height: 'auto', width: '80vw' }}>
                <ModalHeader>
                    <Typography fontWeight="bold" textColor="neutral800" as="h2" id="title">
                        Version Compare
                    </Typography>
                </ModalHeader>
                <ModalBody>
                    <ReactDiffViewer
                        oldValue={JSON.stringify(version1.viewJson, undefined, 4)}
                        newValue={JSON.stringify(version2.viewJson, undefined, 4)}
                        splitView={true}
                        compareMethod={DiffMethod.WORDS}
                        styles={newStyles}
                        leftTitle={`Version Number ${version1.versionNumber}`}
                        rightTitle={`Version Number ${version2.versionNumber}`}
                    // renderContent={highlightSyntax}
                    />
                </ModalBody>
                <ModalFooter startActions={<Button onClick={() => setCompareIsVisible(prev => !prev)} variant="tertiary">
                    Cancel
                </Button>} endActions={<>
                    <Button onClick={() => setCompareIsVisible(prev => !prev)}>Done</Button>
                </>} />
            </ModalLayout>}
        </>)
    }

    const getTablePaginations = () => {
        return (
            <Pagination>
                <PreviousLink as={NavLink} to="/plugins/version-manager/1">
                    Previous
                </PreviousLink>
                <PageLink as={NavLink} to="/plugins/version-manager/1">
                    1
                </PageLink>
                <PageLink as={NavLink} to="/plugins/version-manager/2">
                    2
                </PageLink>
                <NextLink as={NavLink} to="/plugins/version-manager/2">
                    Next page
                </NextLink>
            </Pagination>
        )
    }
    const listContentTypes = () => {
        if (tData && tData.length > 0) {
            return (<>
                <HeaderLayout primaryAction={<Button disabled={checkedItems.size !== 2} onClick={() => setCompareIsVisible(prev => !prev)} >Compare</Button>}
                    secondaryAction={<></>} title="Versions" subtitle="Select any two Content Types to compare" as="h2" />
                <ActionLayout startActions={<>
                 {/* <Select name={"content-type-select"} placeholder={"Select Content Type"}
                            label={"Content Type"} onChange={ ()=> setSelectedContentType} value={selectedContentType} >
                            {contentTypes.map((option) => (
                                <Option key={option} value={option}
                                    startIcon={
                                        <div style={{ height: "6px", borderRadius: "50%", width: "6px", background: option.publishedAt ? "rgb(50, 128, 72)" : "rgb(12, 117, 175)" }} />} >
                                    {option}
                                </Option>
                            ))}
                        </Select> */}
                </>} endActions={<></>} />
                <ContentLayout>
                    <Table colCount={tHeads.length} rowCount={tData.length}
                        footer={<TFooter>{getTablePaginations()}</TFooter>}>
                        <Thead>
                            <Tr>
                                <Th><VisuallyHidden>Checkbox</VisuallyHidden></Th>
                                {tHeadData()}
                                <Th>  <VisuallyHidden>Actions</VisuallyHidden> </Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {tableData()}
                            {compareModal(checkedItems.get(checkedItemIndex[0]), checkedItems.get(checkedItemIndex[1]))}
                        </Tbody>
                    </Table>
                </ContentLayout>
            </>)
        } else {
            return (<div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                No content found
            </div>)
        }
    }
    return listContentTypes();
}

export default memo(ContentType);
