const reflect = p => p.then(v => ({ v, status: 'resolved' }), e => ({ e, status: 'rejected' }));

module.exports = { reflect };
