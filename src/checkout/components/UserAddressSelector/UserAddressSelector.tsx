import { isEqual, map, uniqWith } from "lodash";
import React from "react";

import { Button, Error } from "../../../components";
import { FormAddressType } from "../../../components/ShippingAddressForm/types";
import { FormError } from "../../../core/types";
import { maybe } from "../../../core/utils";
import { AddressPicker } from "../../components/AddressPicker";
import {
  UserAddressSelectorProps,
  UserAddressSelectorState
} from "../../types";

class UserAddressSelector extends React.PureComponent<
  UserAddressSelectorProps,
  UserAddressSelectorState
> {
  constructor(props: UserAddressSelectorProps) {
    super(props);
    const {
      checkout,
      type = "shipping",
      user: {
        addresses: userAddresses,
        defaultBillingAddress,
        defaultShippingAddress
      }
    } = props;
    const addresses = [
      ...(type === "shipping"
        ? [maybe(() => checkout.shippingAddress, defaultShippingAddress)]
        : [maybe(() => checkout.billingAddress, defaultBillingAddress)]),
      ...userAddresses
    ].filter(address => address);

    this.state = {
      addresses: uniqWith(addresses, isEqual),
      selectedAddress: !props.shippingAsBilling && addresses[0]
    };
  }

  componentDidUpdate() {
    this.unselectAddress();
  }

  handleAddressSelect = (address: FormAddressType) => {
    this.setState({ selectedAddress: address });
    this.uncheckShippingAsBilling();
  };

  unselectAddress = () => {
    if (this.state.selectedAddress && this.props.shippingAsBilling) {
      this.setState({ selectedAddress: null });
    }
  };

  uncheckShippingAsBilling = () => {
    const { shippingAsBilling, update } = this.props;
    if (shippingAsBilling) {
      update({
        shippingAsBilling: false
      });
    }
  };

  handleAddressAdd = (callback: () => void) => (address: FormAddressType) => {
    if (address.asNew) {
      this.uncheckShippingAsBilling();
    }

    this.setState(prevState => ({
      addresses: [...prevState.addresses, address],
      ...(address.asNew && {
        selectedAddress: address
      })
    }));
    callback();
  };

  renderErrors = (errors: [] | FormError[]) =>
    map(errors, (error, index) => (
      <p key={index}>
        <Error error={error.message} />
      </p>
    ));

  render() {
    const { addresses, selectedAddress } = this.state;
    const {
      buttonText,
      errors,
      onSubmit,
      loading,
      shippingAsBilling = false,
      type
    } = this.props;

    return (
      <>
        <AddressPicker
          billing={type === "billing"}
          selectedAddress={selectedAddress}
          addresses={addresses}
          onSelect={this.handleAddressSelect}
          onAddNew={this.handleAddressAdd}
          errors={errors}
        />
        {this.renderErrors(errors)}
        <Button
          type="submit"
          disabled={(!selectedAddress && !shippingAsBilling) || loading}
          onClick={() => onSubmit(selectedAddress)}
        >
          {buttonText}
        </Button>
      </>
    );
  }
}

export default UserAddressSelector;