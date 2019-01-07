import * as React from 'react';

// react-md
import Button from 'react-md/lib/Buttons/Button';

export default class LocalPagination extends React.Component {
  constructor(props) {
    super(props);
  }

  _buildPagination() {
    let pagination = {
      page: this.props.page,
      isNextPage: false,
      isPrevPage: false,
      pages: Math.ceil(this.props.items / this.props.itemsPerPage) || 1
    };

    // Set boolean values
    if (pagination.pages > pagination.page) pagination.isNextPage = true;
    if (pagination.page > 1) pagination.isPrevPage = true;

    return pagination;
  }

  render() {
    const pagination = this._buildPagination();

    return (
      <div className="pagination">
        {pagination.isPrevPage ? (
          <Button
            icon
            secondary
            onClick={() => this.props.onGoTo(pagination.page - 1)}
            iconChildren="arrow_back"
          />
        ) : null}

        {pagination.isNextPage ? (
          <Button
            icon
            secondary
            onClick={() => this.props.onGoTo(pagination.page + 1)}
            iconChildren="arrow_forward"
          />
        ) : null}
      </div>
    );
  }
}
