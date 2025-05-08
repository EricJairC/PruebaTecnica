import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import Usuario from './User.model'

@Table({
    tableName: 'token-verif',
    timestamps: false
})
class Token extends Model {
    @Column({
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    })
    declare idToken: number; 

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare token: string;

    @Column({
        type: DataType.DATE,
        defaultValue:() => new Date(),
        allowNull: false
    })
    declare createdAt: Date;

    // Clave foranea
    @ForeignKey(() => Usuario)
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    declare idUsuario: number;

    // Relación de tablas
    @BelongsTo(() => Usuario)
    user!: Usuario;

}

export default Token;