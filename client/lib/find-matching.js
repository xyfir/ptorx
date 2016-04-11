// Finds matching modifiers or filters
// Type 0 matches all types
export default function (items, search) {
    
    search.query = search.query.toLowerCase();
    
    return items.filter(item => {
        if (item.type != search.type && search.type != 0 )
            return false;
        else if (item.name.toLowerCase().indexOf(search.query) > -1)
            return true;
        else if (item.description.toLowerCase().indexOf(search.query) > -1)
            return true;
    });
    
}