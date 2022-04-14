import React from 'react';
import {
    Stack,
    Flex,
    Field,
    FieldLabel,
} from '@strapi/design-system';
import Editor from '../QuillEditor';

const Wrapper = ({ name, onChange, value }) => {
    return (
        <div>
            <Field name={name}>
                <Stack size={2} padding={2}>
                    <Flex>
                        <FieldLabel>{name}</FieldLabel>
                    </Flex>
                    <Editor name={name} onChange={onChange} value={value} />
                </Stack>
            </Field>
        </div>
    );
};

export default Wrapper;