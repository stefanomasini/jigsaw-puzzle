import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { Button, Form, FormGroup, Label, Input } from 'reactstrap';

class App extends Component {
    render() {
        return (
            <div className="container">
                <div className="row">
                    <div className="col-sm">Column 1</div>
                    <div className="col-sm">
                        <Form>
                            <FormGroup>
                                <Label for="exampleEmail">Email</Label>
                                <Input type="email" name="email" id="exampleEmail" placeholder="with a placeholder" />
                            </FormGroup>
                            <FormGroup>
                                <Label for="exampleSelect">Select</Label>
                                <Input type="select" name="select" id="exampleSelect">
                                    <option>1</option>
                                    <option>2</option>
                                    <option>3</option>
                                    <option>4</option>
                                    <option>5</option>
                                </Input>
                            </FormGroup>
                            <FormGroup tag="fieldset">
                                <legend>Radio Buttons</legend>
                                <FormGroup check>
                                    <Label check>
                                        <Input type="radio" name="radio1" /> Option one is this and that—be sure to include why it's great
                                    </Label>
                                </FormGroup>
                                <FormGroup check>
                                    <Label check>
                                        <Input type="radio" name="radio1" /> Option two can be something else and selecting it will deselect option one
                                    </Label>
                                </FormGroup>
                                <FormGroup check disabled>
                                    <Label check>
                                        <Input type="radio" name="radio1" disabled /> Option three is disabled
                                    </Label>
                                </FormGroup>
                            </FormGroup>
                            <FormGroup check>
                                <Label check>
                                    <Input type="checkbox" /> Check me out
                                </Label>
                            </FormGroup>
                            <Button>Submit</Button>
                        </Form>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
