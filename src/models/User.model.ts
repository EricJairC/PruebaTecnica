import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement } from 'sequelize-typescript';

@Table({
    tableName: 'seg_usuario',
    timestamps: false,
})
export class Usuario extends Model {
    @Column({
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    })
    declare idUsuario: number;

    @Column({
       type: DataType.STRING(75),
       allowNull: true,
    })
    declare usuarioAlias: string;

    @Column({
        type: DataType.STRING(75),
        allowNull: true,
     })
    declare usuarioPassword: string;

    @Column({
        type: DataType.STRING(100),
        allowNull: true,
     })
    declare usuarioNombre: string;

    @Column({
        unique: true,
        type: DataType.STRING(100),
        allowNull: true,
    })
    declare usuarioEmail: string;

    @Column({
        type: DataType.ENUM('Activo', 'Inactivo'),
        allowNull: true,
    })
    declare usuarioEstado: 'Activo' | 'Inactivo';

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false
    })
    declare confirmado: boolean;

    @Column({
        type: DataType.CHAR(1),
        allowNull: true,
    })
    declare usuarioConectado: string;

    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    declare usuarioImagen: string;

    @Column({
        type: DataType.DATE,
        field: 'usuarioUltimaConexion',
        allowNull: true,
    })
    declare usuarioUltimaConexion: Date;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false,
    })
    declare admin: boolean
}

export default Usuario;